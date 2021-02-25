import { io } from 'socket.io-client';
import Deferred from './Deferred';
import settings from '../../../settings.json';
import socketTypes from '../../shared/SocketTypes';

class SocketBridge {
  init(type) {
    if (!type) {
      throw new Error('Missing type in init');
    }
    if (!Object.values(socketTypes).some(value => value === type)) {
      throw new Error('Invalid type in init');
    }
    this.socket = io(`http://localhost:${settings.socketPort}`, {
      query: { type }
    });

    const deferred = new Deferred();

    this.socket.on('connect', deferred.resolve);
    this.socket.on('connect_error', deferred.reject);
    this.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected (reason: ${reason})`);
    });

    return deferred.promise;
  }

  emit(eventName, ...data) {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }
    this.socket.emit(eventName, ...data);
  }
}

export default new SocketBridge();
