import { createCommand } from '@naikidev/commiq';

export const SearchCommand = {
  setQuery: (query: string) =>
    createCommand('search:setQuery', { query }),
};
