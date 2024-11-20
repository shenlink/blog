export type CategoryNamesConfig = { [key: string]: { [key: string]: string } }

export type CategoryOrdersConfig = { [key: string]: string[] }

export type CategoryNames =  { [key: string]: string }

export type SubCategoryNamesConfig = { [key: string]: { [key: string]: string } }

export type SubCategoryOrdersConfig = { [key: string]: string[] }

export type SubCategoryNames = { [key: string]: string }

export type HeadConfig = [string, Record<string, string>, string][]

export type FooterConfig = {
    message?: string
    copyright?: string
}