export interface JwtPayload {
  id_account: string;
  id_dependency: string;
  officer: {
    fullname: string;
    jobtitle: string;
  };
}
