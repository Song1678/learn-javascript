import { load, checkQuiz } from '../_helpers.js';

const { quiz } = await load('06-generator/01-predict.js');
checkQuiz(quiz);
