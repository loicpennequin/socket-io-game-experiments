import { addPlugin, defineNuxtModule } from '@nuxt/kit';
import { Server } from 'socket.io';
import fs from 'fs-extra';
import { resolve } from 'pathe';
import { HMR } from '../../events';

const IO_HANDLER_REQUIRE_PATH = './server/io';
const IO_HANDLER_CHOKIDAR_PATH = 'modules/socket-io/server/io.ts';

export default defineNuxtModule({
  setup(_options, nuxt) {
    const dirname = resolve(process.cwd(), 'src/modules/socket-io');
    const PLUGINS_DIR = resolve(dirname, 'plugins');
    fs.readdirSync(PLUGINS_DIR)
      .map(fileName => resolve(PLUGINS_DIR, fileName))
      .forEach(plugin => {
        addPlugin(plugin);
      });

    nuxt.hook('listen', server => {
      const io = new Server(server);
      nuxt.hook('close', () => {
        io.disconnectSockets();
      });
      const { socketIoHandler } = require(IO_HANDLER_REQUIRE_PATH);

      socketIoHandler(io);

      nuxt.hook('builder:watch', (_event, path) => {
        console.log(path, IO_HANDLER_CHOKIDAR_PATH);
        if (path === IO_HANDLER_CHOKIDAR_PATH) {
          io.removeAllListeners();

          delete require.cache[require.resolve(IO_HANDLER_REQUIRE_PATH)];
          const { socketIoHandler } = require(IO_HANDLER_REQUIRE_PATH);
          socketIoHandler(io);
          io.emit(HMR);
          io.disconnectSockets(false);
        }
      });
    });
  }
});
