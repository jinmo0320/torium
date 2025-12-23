export class NameGenerator {
  private static adjectives = [
    "용감한",
    "행복한",
    "빛나는",
    "빠른",
    "조용한",
    "친절한",
    "똑똑한",
    "강인한",
    "신비한",
    "우아한",
    "날렵한",
    "포근한",
    "명랑한",
    "대담한",
    "차분한",
    "위대한",
    "영리한",
    "듬직한",
    "고요한",
    "활기찬",
  ];

  private static nouns = [
    "사자",
    "호랑이",
    "독수리",
    "거북이",
    "돌고래",
    "나무",
    "바람",
    "구름",
    "바다",
    "하늘",
    "태양",
    "별빛",
    "올빼미",
    "여우",
    "고양이",
    "곰",
    "파도",
    "숲",
    "산들바람",
    "불꽃",
  ];

  /**
   * 닉네임 생성 함수
   * @returns 무작위 닉네임
   */
  static generateName(): string {
    const adj =
      this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
    return `${adj}${noun}`;
  }

  /**
   * 태그 생성 함수
   * @param length tag 길이
   * @returns length 길이의 무작위 숫자 생성
   */
  static generateTag(length: number = 6): string {
    const max = Math.pow(10, length) - 1;
    const randomNum = Math.floor(Math.random() * (max + 1));

    return randomNum.toString().padStart(length, "0");
  }
}
