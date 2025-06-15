import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { CallController } from '../controllers/call.controller.js';

const router = express.Router();

// ============= RUTAS DE LLAMADAS =============

/**
 * @route POST /api/calls/initiate
 * @desc Iniciar una nueva llamada
 * @access Private
 */
router.post('/initiate', 
  verifyToken, 
  CallController.initiateCall
);

/**
 * @route PUT /api/calls/:callId/respond
 * @desc Responder a una llamada (aceptar/rechazar)
 * @access Private
 */
router.put('/:callId/respond', 
  verifyToken, 
  CallController.respondToCall
);

/**
 * @route PUT /api/calls/:callId/end
 * @desc Finalizar una llamada
 * @access Private
 */
router.put('/:callId/end', 
  verifyToken, 
  CallController.endCall
);

/**
 * @route GET /api/calls
 * @desc Obtener llamadas del usuario
 * @access Private
 */
router.get('/', 
  verifyToken, 
  CallController.getUserCalls
);

/**
 * @route GET /api/calls/active
 * @desc Obtener llamadas activas del usuario
 * @access Private
 */
router.get('/active', 
  verifyToken, 
  CallController.getActiveCalls
);

/**
 * @route POST /api/calls/:callId/signal
 * @desc Manejar señalización WebRTC
 * @access Private
 */
router.post('/:callId/signal', 
  verifyToken, 
  CallController.handleWebRTCSignaling
);

// Ruta de test para verificar que el endpoint funciona
router.get('/test/ping', (req, res) => {
  res.json({ 
    message: 'Call routes working!', 
    timestamp: new Date().toISOString() 
  });
});

// ============= RUTAS DE LLAMADAS GRUPALES =============

/**
 * @route POST /api/calls/group/initiate
 * @desc Iniciar una nueva llamada grupal
 * @access Private
 */
router.post('/group/initiate', 
  verifyToken, 
  CallController.initiateGroupCall
);

/**
 * @route POST /api/calls/:callId/join
 * @desc Unirse a una llamada grupal
 * @access Private
 */
router.post('/:callId/join', 
  verifyToken, 
  CallController.joinGroupCall
);

/**
 * @route DELETE /api/calls/:callId/leave
 * @desc Abandonar una llamada grupal
 * @access Private
 */
router.delete('/:callId/leave', 
  verifyToken, 
  CallController.leaveGroupCall
);

/**
 * @route GET /api/calls/group/:groupId/active
 * @desc Obtener llamadas activas en un grupo
 * @access Private
 */
router.get('/group/:groupId/active', 
  verifyToken, 
  CallController.getActiveGroupCalls
);

/**
 * @route GET /api/calls/:callId/participants
 * @desc Obtener participantes de una llamada
 * @access Private
 */
router.get('/:callId/participants', 
  verifyToken, 
  CallController.getCallParticipants
);

console.log('📞 Rutas de llamadas configuradas correctamente');

export default router;
