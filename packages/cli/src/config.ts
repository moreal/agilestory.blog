import { egloos } from "@agilestory/core"
import { Config } from "effect"

/** 데이터 캐시 디렉터리. 환경변수 AGILEDATA, 기본값 ./data */
export const dataPath = Config.String("AGILEDATA").pipe(Config.withDefault("data"))

/** 기본 수집 대상: 애자일 이야기(agile.egloos.com). */
export const egloosSource = egloos("agile").source
