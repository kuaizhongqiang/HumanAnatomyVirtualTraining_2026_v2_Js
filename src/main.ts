import './styles/index.css';
import { mountApp } from './ui/app';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app 容器缺失：检查 index.html');

mountApp(root);
