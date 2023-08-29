import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { DeleteIcon } from "../../assets/icons/DeleteIcon";
import { IColumn, ITask } from "../../shared/interfaces";
import styles from "./ColumnContainer.module.scss";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { PlusIcon } from "../../assets/icons/PlusIcon";
import { TaskCard } from "../TaskCard/TaskCard";

interface ColumnProps {
  column: IColumn;
  tasks: ITask[];
  deleteColumn: (id: string | number) => void;
  updateColumnTitle: (id: string | number, title: string) => void;
  createTask: (id: string | number) => void;
  deleteTask: (id: string | number) => void;
  editTask: (id: string | number, content: string) => void;
}

export const ColumnContainer: React.FC<ColumnProps> = ({
  deleteColumn,
  column,
  updateColumnTitle,
  createTask,
  tasks,
  deleteTask,
  editTask,
}) => {
  const [editTitleMode, setEditTitleMode] = useState<boolean>(false);

  const tasksId = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editTitleMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        style={style}
        ref={setNodeRef}
        className={`${styles.columnContainer} border-2 border-rose-500 opacity-70`}
      ></div>
    );
  }

  return (
    <div style={style} ref={setNodeRef} className={styles.columnContainer}>
      <div {...attributes} {...listeners} className={styles.header}>
        <div
          onClick={() => {
            setEditTitleMode(true);
          }}
          className={styles.titleWrapper}
        >
          <div className={styles.number}>{tasks.length}</div>
          {!editTitleMode && column.title}
          {editTitleMode && (
            <input
              value={column.title}
              onChange={(event) =>
                updateColumnTitle(column.id, event.target.value)
              }
              autoFocus
              onBlur={() => setEditTitleMode(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setEditTitleMode(false);
                }
                return;
              }}
            />
          )}
        </div>
        <button onClick={() => deleteColumn(column.id)}>
          <DeleteIcon />
        </button>
      </div>
      <div className={styles.content}>
        <SortableContext items={tasksId}>
          {tasks.map((task) => (
            <TaskCard
              editTask={editTask}
              deleteTask={deleteTask}
              key={task.id}
              task={task}
            />
          ))}
        </SortableContext>
      </div>
      <div className={styles.footer}>
        <button onClick={() => createTask(column.id)}>
          <PlusIcon /> New task
        </button>
      </div>
    </div>
  );
};
