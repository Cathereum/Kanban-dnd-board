import { useState } from "react";
import { DeleteIcon } from "../../assets/icons/DeleteIcon";
import { ITask } from "../../shared/interfaces";
import styles from "./TaskCard.module.scss";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: ITask;
  deleteTask: (id: string | number) => void;
  editTask: (id: string | number, content: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  deleteTask,
  editTask,
}) => {
  const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);
  const [editTaskMode, setEditTaskMode] = useState<boolean>(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: editTaskMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        className={`${styles.taskCard} border border-rose-500 opacity-50`}
        style={style}
        ref={setNodeRef}
      />
    );
  }

  const taskModeToggle = () => {
    setEditTaskMode((prev) => !prev);
    setMouseIsOver(false);
  };

  if (editTaskMode)
    return (
      <div
        style={style}
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={styles.taskCard}
      >
        <textarea
          autoFocus
          value={task.content}
          onBlur={taskModeToggle}
          onChange={(event) => editTask(task.id, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.shiftKey) {
              taskModeToggle();
            }
            return;
          }}
        />
      </div>
    );

  return (
    <div
      style={style}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`${styles.taskCard} task`}
      onMouseEnter={() => setMouseIsOver(true)}
      onMouseLeave={() => setMouseIsOver(false)}
    >
      <div onClick={taskModeToggle} className={styles.content}>
        <p className="whitespace-pre-wrap ">{task.content}</p>
      </div>

      {mouseIsOver && (
        <button onClick={() => deleteTask(task.id)}>
          <DeleteIcon />
        </button>
      )}
    </div>
  );
};
