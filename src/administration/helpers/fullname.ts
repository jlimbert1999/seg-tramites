import { Officer } from 'src/users/schemas';

export function fullname(officer: Officer): string {
  if (!officer) return 'Desvinculado';
  return [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(' ');
}
