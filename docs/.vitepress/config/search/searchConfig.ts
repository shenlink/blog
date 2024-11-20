import { DefaultTheme } from "vitepress";

type SearchConfig = | { provider: 'local'; options?: DefaultTheme.LocalSearchOptions }
    | { provider: 'algolia'; options: DefaultTheme.AlgoliaSearchOptions }

export const search: SearchConfig = {
    provider: 'local',
    options: {
        translations: {
            button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索'
            },
            modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                    selectText: '选择',
                    navigateText: '切换'
                }
            }
        }
    }
};
