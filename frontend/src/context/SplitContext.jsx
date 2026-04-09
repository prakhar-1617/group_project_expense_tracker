import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SplitContext = createContext(null);

export function SplitProvider({ children }) {
  const { user } = useAuth();
  const [splits, setSplits] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data when user logs in
  useEffect(() => {
    if (user) {
      setContacts(user.contacts || []);
      const fetchSplits = async () => {
        try {
          const res = await API.get('/splits');
          setSplits(res.data);
        } catch (error) {
          console.error("Failed to fetch splits", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSplits();
    } else {
      setSplits([]);
      setContacts([]);
      setLoading(false);
    }
  }, [user]);

  // ─── Splits ───────────────────────────────────────────
  const addSplit = useCallback(async (data) => {
    try {
      const res = await API.post('/splits', data);
      setSplits((prev) => [res.data, ...prev]);
      toast.success('Split created successfully');
      return res.data;
    } catch (error) {
      toast.error('Failed to create split');
      console.error(error);
    }
  }, []);

  const deleteSplit = useCallback(async (splitId) => {
    try {
      await API.delete(`/splits/${splitId}`);
      setSplits((prev) => prev.filter((s) => s._id !== splitId));
      toast.success('Split deleted');
    } catch (error) {
      toast.error('Failed to delete split');
      console.error(error);
    }
  }, []);

  const markSettled = useCallback(async (splitId, participantEmail) => {
    try {
      const res = await API.put(`/splits/${splitId}/settle`, { participantEmail });
      setSplits((prev) => prev.map((s) => (s._id === splitId ? res.data : s)));
      toast.success('Settlement updated');
    } catch (error) {
      toast.error('Failed to update settlement');
      console.error(error);
    }
  }, []);

  // ─── Contacts ─────────────────────────────────────────
  const addContact = useCallback(async (contact) => {
    // Check local state first to prevent duplicate API calls
    if (contacts.some((c) => c.email.toLowerCase() === contact.email.toLowerCase())) {
        return;
    }
    try {
      const res = await API.post('/auth/contacts', contact);
      setContacts(res.data); // The backend returns the updated full contacts array
      toast.success('Contact added');
    } catch (error) {
      toast.error('Failed to add contact');
      console.error(error);
    }
  }, [contacts]);

  const removeContact = useCallback(async (contactEmail) => {
    try {
      const res = await API.delete(`/auth/contacts/${contactEmail}`);
      setContacts(res.data);
      toast.success('Contact removed');
    } catch (error) {
      toast.error('Failed to remove contact');
      console.error(error);
    }
  }, []);

  // Auto-save any new participants as contacts
  const addSplitAndSaveContacts = useCallback(async (data) => {
    // Add split first
    const newSplitRes = await addSplit(data);
    if (!newSplitRes) return;

    // Save new participants to contacts
    for (const p of data.participants) {
      if (p.email && p.name && p.email !== user?.email) {
        // Only run addContact which checks for existence
        addContact({ name: p.name, email: p.email });
      }
    }
    return newSplitRes;
  }, [addSplit, addContact, user]);

  // ─── Computed values ──────────────────────────────────
  const totalSplit = splits.reduce((sum, s) => sum + s.totalAmount, 0);

  const youAreOwed = splits.reduce((sum, s) => {
    if (s.paidBy !== 'You' && s.paidBy !== user?.name) return sum;
    // You paid for it
    return sum + s.participants
      .filter((p) => p.email !== user?.email && p.name !== 'You' && !p.settled)
      .reduce((a, p) => a + p.share, 0);
  }, 0);

  const youOwe = splits.reduce((sum, s) => {
    if (s.paidBy === 'You' || s.paidBy === user?.name) return sum;
    // Someone else paid, let's see if you are a participant and haven't settled
    const you = s.participants.find((p) => p.email === user?.email || p.name === 'You');
    if (you && !you.settled) return sum + you.share;
    return sum;
  }, 0);

  return (
    <SplitContext.Provider value={{
      splits, contacts, loading,
      addSplit: addSplitAndSaveContacts, deleteSplit, markSettled,
      addContact, removeContact,
      totalSplit, youAreOwed, youOwe,
    }}>
      {children}
    </SplitContext.Provider>
  );
}

export const useSplit = () => useContext(SplitContext);
