import { DefaultTheme } from "vitepress";

type SearchConfig = | { provider: 'local'; options?: DefaultTheme.LocalSearchOptions }
    | { provider: 'algolia'; options: DefaultTheme.AlgoliaSearchOptions }

export const search: SearchConfig = {
    provider: 'local'
};
