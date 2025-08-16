import { BehaviorSubject } from 'rxjs';
import type { Contract } from '../models/Contract';

export const contracts$ = new BehaviorSubject<Contract[]>([]);
