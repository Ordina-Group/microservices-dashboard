var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
import { cleanAndCompile, expect, fixturePath, createConfig } from './utils';
describe('salsa test', function () {
    it('should compile js file', function () {
        return __awaiter(this, void 0, void 0, function* () {
            let config = {
                entry: fixturePath(['salsa', 'index.ts'])
            };
            let tsconfig = fixturePath(['salsa', 'tsconfig.json']);
            let loaderQuery = { tsconfig };
            let exclude = [/exclude/];
            let stats = yield cleanAndCompile(createConfig(config, { loaderQuery, exclude }));
            console.log(stats.compilation.errors);
            expect(stats.compilation.errors.length).eq(2);
            expect(stats.compilation.errors[0].toString()).include('Cannot find module');
            expect(stats.compilation.errors[1].toString()).include(`Argument of type 'string'`);
        });
    });
});
