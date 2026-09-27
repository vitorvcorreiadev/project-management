export interface Project {
  id: number
  title: string
  client: string
  started_at: string
  end_at: string
  favorited: boolean
}

export type SortParam = keyof Project
export type SortRule = 'asc' | 'desc'
