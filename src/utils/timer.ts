export class Timer {
  /**
   * 현재 시간을 반환하는 함수
   * @returns 한국 표준시(KST) ISO Format String
   */
  static getTimestampKST(): string {
    const now = new Date();
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const korDate = new Date(now.getTime() + KR_TIME_DIFF);
    return korDate.toISOString().replace("Z", "+09:00");
  }
}
