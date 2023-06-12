export interface JwtPayload {
    id_account: string
    officer: {
        fullname: string,
        jobtitle: string
    }
}
