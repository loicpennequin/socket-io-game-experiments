export const useSocketEvent = <T = unknown>(
  name: string,
  callback: (payload: T) => void
) => {
  const socket = useSocket();

  onMounted(() => {
    socket.on(name, callback);
  });

  onUnmounted(() => {
    socket.off(name, callback);
  });
};
