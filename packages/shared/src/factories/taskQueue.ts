export const createTaskQueue = <TTask extends () => void>() => {
  const tasks: TTask[] = [];
  return {
    schedule(task: TTask) {
      tasks.push(task);
    },

    process() {
      let task = tasks.shift();
      while (task) {
        task();

        task = tasks.shift();
      }
    }
  };
};

export type TaskQueue = ReturnType<typeof createTaskQueue>;
