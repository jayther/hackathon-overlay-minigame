const { createServer } = require('http');
const { Server } = require('socket.io');
const socketTypes = require('../shared/SocketTypes');

const logger = require('./utils/logger');
const globalEmitter = require('./utils/GlobalEmitter');
const { socketEvents } = require('./consts');

class SocketManager {
  constructor(settings) {
    this.settings = settings;
    this.overlaySockets = [];
    this.controlSockets = [];
  }
  async init() {
    this.httpSocketServer = createServer();
    this.io = new Server(this.httpSocketServer, {
      cors: {
        origin: `http://localhost:${this.settings.webPort}`,
        methods: ['GET', 'POST']
      }
    });
    this.io.on('connection', this.onIOConnection.bind(this));
    this.httpSocketServer.listen(this.settings.socketPort);
    logger(`Socket server ready (port ${this.settings.socketPort})`);
  }

  onIOConnection(socket) {
    if (!socket.handshake.query) {
      logger('Missing socket query');
      return;
    }
    if (!socket.handshake.query.type) {
      logger('Missing type in socket query');
      return;
    }

    const socketType = socket.handshake.query.type;
    switch (socketType) {
      case socketTypes.overlay:
        // TODO: limit to one overlay connection?
        socket.join(socketType);
        this.addOverlaySocket(socket);
        break;
      case socketTypes.control:
        socket.join(socketType);
        this.addControlSocket(socket);
        break;
      default:
        logger(`Type in socket query must be "overlay" or "control" (received ${socketType})`);
    }    
  }
  
  addOverlaySocket(socket) {
    socket.on('disconnect', reason => this.removeOverlaySocket(socket, reason));
    this.overlaySockets.push(socket);
    globalEmitter.emit(socketEvents.overlayAdded, socket);
    logger(`Overlay socket connected (id: ${socket.id})`);
  }

  removeOverlaySocket(socket, reason) {
    const index = this.overlaySockets.indexOf(socket);
    if (index === -1) {
      logger(`Attempted to remove a socket (id: ${socket.id}) that is not in overlaySockets (Reason: ${reason}`);
      return;
    }
    this.overlaySockets.splice(index, 1);
    globalEmitter.emit(socketEvents.overlayRemoved, socket, reason);
    logger(`Overlay socket (id: ${socket.id}) disconnected (Reason: ${reason})`);
  }

  addControlSocket(socket) {
    socket.on('disconnect', reason => this.removeControlSocket(socket, reason));
    this.controlSockets.push(socket);
    globalEmitter.emit(socketEvents.controlAdded, socket);
    logger(`Control socket connected (id: ${socket.id})`);
  }

  removeControlSocket(socket, reason) {
    const index = this.controlSockets.indexOf(socket);
    if (index === -1) {
      logger(`Attempted to remove a socket (id: ${socket.id}) that is not in controlSockets (Reason: ${reason}`);
      return;
    }
    this.controlSockets.splice(index, 1);
    globalEmitter.emit(socketEvents.controlRemoved, socket, reason);
    logger(`Control socket (id: ${socket.id}) disconnected (Reason: ${reason})`);
  }

  allEmit(eventName, ...data) {
    this.io.to(socketTypes.control).to(socketTypes.overlay).emit(eventName, ...data);
  }

  overlayEmit(eventName, ...data) {
    this.io.to(socketTypes.overlay).emit(eventName, ...data);
  }

  controlEmit(eventName, ...data) {
    this.io.to(socketTypes.control).emit(eventName, ...data);
  }
}

module.exports = SocketManager;
