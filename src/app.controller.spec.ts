import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe("getHealth", () => {
    it("should return health status", () => {
      const result = { status: "ok" };
      jest.spyOn(appService, "getHealth").mockImplementation(() => result);
      expect(appController.getHealth()).toEqual(result);
    });
  });
});
