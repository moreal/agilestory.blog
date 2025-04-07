import type { RawPages } from "../../models/raw-pages.ts";
import type { RawPagesRepository } from "../../repositories/raw-pages/mod.ts";
import type { WaybackMachineService } from "../wayback.ts";

export class RawPagesLoader {
  constructor(
    private readonly rawPagesRepository: RawPagesRepository,
    private readonly waybackMachineService: WaybackMachineService,
  ) {}

  async load(): Promise<RawPages> {
    const rawPages = await this.rawPagesRepository.get();
    if (rawPages) {
      return rawPages;
    }

    // TODO: Make this configurable
    const pages = await this.waybackMachineService.getTimemap(
      "agile.egloos.com/",
      "^https://agile.egloos.com/[0-9]+$",
    );
    await this.rawPagesRepository.save(pages);

    return pages;
  }
}
