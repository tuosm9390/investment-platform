import fs from 'fs';
import path from 'path';

/**
 * 지정된 경로의 프롬프트 마크다운 파일을 읽어옵니다.
 * @param fileName 읽어올 파일명 (예: 'SMC_prompt.md')
 * @returns 파일 내용 문자열
 */
export function loadPrompt(fileName: string): string {
  try {
    const filePath = path.join(process.cwd(), 'src', 'prompt', fileName);
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`프롬프트 로딩 실패: ${fileName}`, error);
    return '';
  }
}
