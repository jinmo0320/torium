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

  export class Profile {
    constructor(
      public readonly monthlyAmount: number,
      public readonly years: number,
      public readonly returnRate: number,
      public readonly targetAmount: number,
    ) {}
  }
}
