export class Timer {
  /**
   * 현재 시간을 반환하는 함수
   * @param afterMinutes 현재 시간에서 몇 분 후의 시간을 반환할지 (기본값: 0)
   * @returns 한국 표준시(KST) ISO Format String
   */
  static getTimestampKST(afterMinutes: number = 0): string {
    const now = new Date();
    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const korDate = new Date(
      now.getTime() + KR_TIME_DIFF + afterMinutes * 60 * 1000,
    );
    return korDate.toISOString().replace("Z", "+09:00");
  }
}
