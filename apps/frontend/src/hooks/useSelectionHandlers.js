import { useState } from 'react';

export const useSelectionHandlers = (initialGroup, initialSort) => {
  const [selectedGroup, setSelectedGroup] = useState(initialGroup);
  const [sortKey, setSortKey] = useState(initialSort);

  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortKey(event.target.value);
  };

  return {
    selectedGroup,
    sortKey,
    handleGroupChange,
    handleSortChange
  };
};