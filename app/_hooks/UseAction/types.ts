export type ActionResponse<R, E> = {
    isSuccess: boolean
    response?:
      | {
          data: R
        }
      | null
      | R
    errors?: E
    code: number | null
  }