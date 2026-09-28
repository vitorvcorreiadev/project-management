export interface Project {
  id: number
  name: string
  client: string
  started_at: string
  end_at: string
  favorited: boolean
  hasCover: boolean
}

export type SortParam = keyof Project
export type SortRule = 'asc' | 'desc'
