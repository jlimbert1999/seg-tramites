import { Officer } from "../schemas";

export function createFullName(officer: Officer) {
    return [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ")
}