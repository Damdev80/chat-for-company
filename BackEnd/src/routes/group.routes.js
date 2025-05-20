import { Router } from 'express'
import { GroupController } from '../controllers/group.controller.js'
import { verifyToken } from '../middlewares/auth.middleware.js'
import { checkRole } from '../middlewares/role.middleware.js' // Import checkRole

const router = Router()

router.get('/', verifyToken, GroupController.getAll)
// Only admins can create groups
router.post('/', verifyToken, checkRole(['admin']), GroupController.create)
router.put('/:id', verifyToken, GroupController.update)
// Only admins can delete groups
router.delete('/:id', verifyToken, checkRole(['admin']), GroupController.delete)
// Borrar todos los mensajes de un grupo (solo admin)
router.delete('/:id/messages', verifyToken, checkRole(['admin']), GroupController.deleteMessages)

export default router
