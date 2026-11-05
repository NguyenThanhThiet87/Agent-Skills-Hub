import express from 'express';
import multer from 'multer';
import {
  getAllSkills,
  getOneSkill,
  uploadOrSaveSkill,
  removeSkill,
  getSystemHealth
} from '../controllers/skillController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = express.Router();

router.get('/health', getSystemHealth);
router.get('/', getAllSkills);
router.get('/:name', getOneSkill);
router.post('/', upload.single('file'), uploadOrSaveSkill);
router.post('/upload', upload.single('file'), uploadOrSaveSkill);
router.delete('/:name', removeSkill);

export default router;
