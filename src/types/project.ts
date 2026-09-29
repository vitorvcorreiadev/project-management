export interface Project {
  id: number
  name: string
  client: string
  started_at: string
  end_at: string
  favorited: boolean
  hasCover: boolean
}

export type SortParam = 'name' | 'client' | 'started_at' | 'end_at'
export type SortRule = 'asc' | 'desc'
export type SortState = { param: SortParam; rule: SortRule }
export type FilterState = { favorited: boolean }

export type ProjectInput = Pick<Project, 'name' | 'client' | 'started_at' | 'end_at'>
