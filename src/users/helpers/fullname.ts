interface Person {
  nombre: string;
  paterno?: string;
  materno?: string;
}
export const buildFullname = (person: Person): string => {
  if (!person) return 'Sin nombre';
  return [person.nombre, person.paterno, person.materno].filter(Boolean).join(' ');
};
