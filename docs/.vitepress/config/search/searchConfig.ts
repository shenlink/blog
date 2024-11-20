import { DefaultTheme } from "vitepress";

export type SearchConfig = | { provider: 'local'; options?: DefaultTheme.LocalSearchOptions }
    | { provider: 'algolia'; options: DefaultTheme.AlgoliaSearchOptions }

export const search: SearchConfig = {
    provider: 'local'
};
