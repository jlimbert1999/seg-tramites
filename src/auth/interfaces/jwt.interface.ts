export interface JwtPayload {
  id_account: string;
  id_dependency: string;
  officer: officer;
}
interface officer {
  fullname: string;
  jobtitle: string;
}
