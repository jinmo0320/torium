export namespace SurveyDto {
  export class Question {
    constructor(
      public readonly title: string,
      public readonly answers: [string, string, string, string],
    ) {}
  }

  export class Response {
    constructor(public readonly questions: Array<Question>) {}
  }
}
