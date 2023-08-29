export interface IColumn {
  id: string | number;
  title: string;
}

export interface ITask {
  id: string | number;
  columnId: string | number;
  content: string;
}
