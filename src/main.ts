import './style.css';
import { mountShell } from './ui/shell';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app 容器缺失：检查 index.html');

mountShell(root);
