var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { FileAnalyzer } from './deps';
import { loadLib } from './helpers';
let promisify = require('es6-promisify');
let objectAssign = require('object-assign');
let RUNTIME = loadLib('../lib/runtime.d.ts');
export class ModuleResolutionHost {
    constructor(servicesHost) {
        this.resolutionCache = {};
        this.servicesHost = servicesHost;
    }
    fileExists(fileName) {
        return this.servicesHost.getScriptSnapshot(fileName) !== undefined;
    }
    readFile(fileName) {
        let snapshot = this.servicesHost.getScriptSnapshot(fileName);
        return snapshot && snapshot.getText(0, snapshot.getLength());
    }
}
export class Host {
    constructor(state) {
        this.state = state;
        this.moduleResolutionHost = new ModuleResolutionHost(this);
    }
    getScriptFileNames() {
        return this.state.allFileNames();
    }
    getScriptVersion(fileName) {
        if (this.state.getFile(fileName)) {
            return this.state.getFile(fileName).version.toString();
        }
    }
    getScriptSnapshot(fileName) {
        let file = this.state.getFile(fileName);
        if (!file) {
            try {
                if (!fileName.match(/\.tsx?$|package[.]json?$/)) {
                    let matchedExcludes = this.state.options.exclude.filter((excl) => {
                        return fileName.indexOf(excl) !== -1;
                    });
                    if (matchedExcludes.length > 0) {
                        return;
                    }
                }
                let text = this.state.readFileSync(fileName);
                file = {
                    version: 0,
                    text
                };
                if (path.basename(fileName) !== 'package.json') {
                    file = this.state.addFile(fileName, text);
                }
            }
            catch (e) {
                return;
            }
        }
        return this.state.ts.ScriptSnapshot.fromString(file.text);
    }
    getCurrentDirectory() {
        return process.cwd();
    }
    getScriptIsOpen() {
        return true;
    }
    getCompilationSettings() {
        return this.state.options;
    }
    getDefaultLibFileName(options) {
        return options.target === this.state.ts.ScriptTarget.ES6 ?
            this.state.compilerInfo.lib6.fileName :
            this.state.compilerInfo.lib5.fileName;
    }
    resolveModuleNames(moduleNames, containingFile) {
        let resolvedModules = [];
        for (let moduleName of moduleNames) {
            let resolvedFileName;
            let resolvedModule;
            try {
                resolvedFileName = this.state.resolver(this.state.normalizePath(path.dirname(containingFile)), moduleName);
                if (!resolvedFileName.match(/\.tsx?$/)) {
                    resolvedFileName = null;
                }
            }
            catch (e) {
                resolvedFileName = null;
            }
            let tsResolved = this.state.ts.resolveModuleName(resolvedFileName || moduleName, containingFile, this.state.options, this.moduleResolutionHost);
            if (tsResolved.resolvedModule) {
                resolvedModule = tsResolved.resolvedModule;
            }
            else {
                resolvedModule = {
                    resolvedFileName: resolvedFileName || ''
                };
            }
            this.moduleResolutionHost.resolutionCache[`${containingFile}::${moduleName}`] = resolvedModule;
            resolvedModules.push(resolvedModule);
        }
        return resolvedModules;
    }
    log(message) {
    }
}
export class State {
    constructor(options, fsImpl, compilerInfo, resolver) {
        this.files = {};
        this.ts = compilerInfo.tsImpl;
        this.compilerInfo = compilerInfo;
        this.resolver = resolver;
        this.fs = fsImpl;
        this.readFileImpl = promisify(this.fs.readFile.bind(this.fs));
        this.host = new Host(this);
        this.services = this.ts.createLanguageService(this.host, this.ts.createDocumentRegistry());
        this.fileAnalyzer = new FileAnalyzer(this);
        this.options = {};
        objectAssign(this.options, options);
        if (this.options.emitRequireType) {
            this.addFile(RUNTIME.fileName, RUNTIME.text);
        }
        if (!this.options.noLib) {
            if (this.options.target === this.ts.ScriptTarget.ES6 || this.options.library === 'es6') {
                this.addFile(this.compilerInfo.lib6.fileName, this.compilerInfo.lib6.text);
            }
            else {
                this.addFile(this.compilerInfo.lib5.fileName, this.compilerInfo.lib5.text);
            }
        }
    }
    updateProgram() {
        this.program = this.services.getProgram();
    }
    allFileNames() {
        return Object.keys(this.files);
    }
    getSourceFile(fileName) {
        let services = this.services;
        return (services.getSourceFile || services.getNonBoundSourceFile)(fileName);
    }
    allFiles() {
        return this.files;
    }
    emit(fileName) {
        fileName = this.normalizePath(fileName);
        if (!this.program) {
            this.program = this.services.getProgram();
        }
        let outputFiles = [];
        function writeFile(fileName, data, writeByteOrderMark) {
            outputFiles.push({
                sourceName: fileName,
                name: fileName,
                writeByteOrderMark: writeByteOrderMark,
                text: data
            });
        }
        let source = this.program.getSourceFile(fileName);
        if (!source) {
            this.updateProgram();
            source = this.program.getSourceFile(fileName);
            if (!source) {
                throw new Error(`File ${fileName} was not found in program`);
            }
        }
        let emitResult = this.program.emit(source, writeFile);
        let output = {
            outputFiles: outputFiles,
            emitSkipped: emitResult.emitSkipped
        };
        if (!output.emitSkipped) {
            return output;
        }
        else {
            throw new Error("Emit skipped");
        }
    }
    fastEmit(fileName) {
        fileName = this.normalizePath(fileName);
        let file = this.getFile(fileName);
        if (!file) {
            throw new Error(`Unknown file ${fileName}`);
        }
        let transpileResult = this.ts.transpileModule(file.text, {
            compilerOptions: this.options,
            reportDiagnostics: false,
            fileName
        });
        return {
            text: transpileResult.outputText,
            sourceMap: transpileResult.sourceMapText
        };
    }
    updateFile(fileName, text, checked = false) {
        fileName = this.normalizePath(fileName);
        let prevFile = this.files[fileName];
        let version = 0;
        let changed = true;
        if (prevFile) {
            if (!checked || (checked && text !== prevFile.text)) {
                version = prevFile.version + 1;
            }
            else {
                changed = false;
            }
        }
        this.files[fileName] = {
            text: text,
            version: version
        };
        return changed;
    }
    addFile(fileName, text) {
        fileName = this.normalizePath(fileName);
        return this.files[fileName] = {
            text: text,
            version: 0
        };
    }
    getFile(fileName) {
        fileName = this.normalizePath(fileName);
        return this.files[fileName];
    }
    hasFile(fileName) {
        fileName = this.normalizePath(fileName);
        return this.files.hasOwnProperty(fileName);
    }
    readFile(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            fileName = this.normalizePath(fileName);
            let buf = yield this.readFileImpl(fileName);
            let string = buf.toString('utf8');
            return string;
        });
    }
    readFileSync(fileName) {
        fileName = this.normalizePath(fileName);
        return fs.readFileSync(fileName, { encoding: 'utf-8' });
    }
    readFileAndAdd(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            fileName = this.normalizePath(fileName);
            let text = yield this.readFile(fileName);
            this.addFile(fileName, text);
        });
    }
    readFileAndUpdate(fileName, checked = false) {
        return __awaiter(this, void 0, void 0, function* () {
            fileName = this.normalizePath(fileName);
            let text = yield this.readFile(fileName);
            return this.updateFile(fileName, text, checked);
        });
    }
    readFileAndUpdateSync(fileName, checked = false) {
        fileName = this.normalizePath(fileName);
        let text = this.readFileSync(fileName);
        return this.updateFile(fileName, text, checked);
    }
    normalizePath(filePath) {
        return path.normalize(filePath);
    }
}
export function TypeScriptCompilationError(diagnostics) {
    this.diagnostics = diagnostics;
}
util.inherits(TypeScriptCompilationError, Error);
