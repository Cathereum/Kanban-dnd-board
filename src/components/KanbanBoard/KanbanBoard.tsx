import styles from "./KanbanBoard.module.scss";
import { useMemo, useState } from "react";
import { PlusIcon } from "../../assets/icons/PlusIcon";
import { IColumn, ITask } from "../../shared/interfaces";
import { ColumnContainer } from "../KanbanColumn/ColumnContainer";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { TaskCard } from "../TaskCard/TaskCard";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

export const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<IColumn[]>([]);
  const [activeColumn, setActiveColumn] = useState<IColumn | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [activeTask, setActiveTask] = useState<ITask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const columnsId = useMemo(() => {
    return columns.map((column) => column.id);
  }, [columns]);

  /*generate random num btw 0 & 1000*/
  const generateId = () => {
    return Math.floor(Math.random() * 1001);
  };

  const createNewColumn = () => {
    const columnToAdd: IColumn = {
      id: generateId(),
      title: `New status`,
    };

    setColumns([...columns, columnToAdd]);
  };

  const deleteColumn = (id: string | number) => {
    const filteredColumns: IColumn[] = columns.filter(
      (column) => column.id !== id
    );
    const filteredTasks: ITask[] = tasks.filter((task) => task.columnId !== id);
    setColumns(filteredColumns);
    setTasks(filteredTasks);
  };

  const updateColumnTitle = (id: string | number, title: string) => {
    const newColumns: IColumn[] = columns.map((column) => {
      if (column.id !== id) {
        return column;
      }
      return { ...column, title: title };
    });
    setColumns(newColumns);
  };

  const createTask = (id: string | number) => {
    const newTask: ITask = {
      id: generateId(),
      columnId: id,
      content: `Task ${tasks.length + 1}`,
    };
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: string | number) => {
    const filteredTasks: ITask[] = tasks.filter((task) => task.id !== id);
    setTasks(filteredTasks);
  };

  const editTask = (id: string | number, content: string) => {
    const taskAfterEdit = tasks.map((task) => {
      return task.id !== id ? task : { ...task, content: content };
    });

    setTasks(taskAfterEdit);
  };

  const onDragStart = (event: DragStartEvent) => {
    console.log("Drag Start", event);
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
    }
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) {
      return;
    }
    const activeColumnId = active.id;
    const overColumnId = over.id;

    if (activeColumnId === overColumnId) {
      return;
    }

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (column) => column.id === activeColumnId
      );

      const overColumnIndex = columns.findIndex(
        (column) => column.id === overColumnId
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };

  const onDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const activeTaskId = active.id;
    const overTaskId = over.id;

    if (activeTaskId === overTaskId) {
      return;
    }

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    /* drop a task inside parent column */
    if (isActiveTask && isOverTask) {
      setTasks((tasks) => {
        const activeTaskIndex = tasks.findIndex(
          (task) => task.id === activeTaskId
        );
        const overTaskIndex = tasks.findIndex((task) => task.id === overTaskId);

        tasks[activeTaskIndex].columnId = tasks[overTaskIndex].columnId;
        return arrayMove(tasks, activeTaskIndex, overTaskIndex);
      });
    }

    /* drop a task to another column */
    const isOverColumn = over.data.current?.type === "Column";

    if (isActiveTask && isOverColumn) {
      setTasks((tasks) => {
        const activeTaskIndex = tasks.findIndex(
          (task) => task.id === activeTaskId
        );

        tasks[activeTaskIndex].columnId = overTaskId;
        return arrayMove(tasks, activeTaskIndex, activeTaskIndex);
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className={styles.kanbanBoard}>
        <div>
          <button className="mb-2" onClick={createNewColumn}>
            <PlusIcon /> Add column
          </button>
          <div className="flex gap-2">
            <SortableContext items={columnsId}>
              {columns.map((column) => (
                <ColumnContainer
                  createTask={createTask}
                  updateColumnTitle={updateColumnTitle}
                  key={column.id}
                  deleteColumn={deleteColumn}
                  column={column}
                  tasks={tasks.filter((task) => task.columnId === column.id)}
                  deleteTask={deleteTask}
                  editTask={editTask}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      </div>
      {createPortal(
        <DragOverlay>
          {activeColumn && (
            <ColumnContainer
              createTask={createTask}
              updateColumnTitle={updateColumnTitle}
              column={activeColumn}
              deleteColumn={deleteColumn}
              tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
              deleteTask={deleteTask}
              editTask={editTask}
            />
          )}
          {activeTask && (
            <TaskCard
              task={activeTask}
              editTask={editTask}
              deleteTask={deleteTask}
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
};
