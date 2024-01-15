import { Officer } from "src/users/schemas";


export function createFullName(officer: Officer) {
    return [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ")
}