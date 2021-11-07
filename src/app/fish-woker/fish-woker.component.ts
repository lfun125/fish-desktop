import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProcessClose } from '../common';

declare var window: any;

@Component({
  selector: 'app-fish-woker',
  templateUrl: './fish-woker.component.html',
  styleUrls: ['./fish-woker.component.scss']
})
export class FishWokerComponent {

  fishing = -1;

  addressForm?: FormGroup;

  preKey = preKey;

  cycleList: number[] = [];

  logList: string[] = [];

  // isRun: boolean = false;

  constructor(private fb: FormBuilder) {
    this.initForm();
    this.receiveLog();
  }

  close() {
    ProcessClose();
  }

  receiveLog() {
    if (!window.ipcRenderer) {
      return;
    }
    const ipcRenderer = window.ipcRenderer;
    ipcRenderer.receive('fish_log', (data: any) => {
      const n = this.logList.unshift(data);
      if (n > 1000) {
        this.logList.pop();
      }
    });
    ipcRenderer.receive('action', (data: any) => {
      if (data == 'kill') {
        this.fishing = -1;
        this.logList = [];
      } else {
        this.fishing = 1;
      }
    });
    setInterval(() => {
    }, 500);
  }

  initForm() {
    this.addressForm = this.fb.group({
      fb: ['1', Validators.required], // 钓鱼按键，如果是坐标用逗号隔开 (default 1)
      om: ['2', Validators.required], // 打开河蚌箱子宏按键，如果是坐标用逗号隔开 (default 2)
      l: ['4', Validators.required],  // 明亮度大于等于这个值就收杆 (default 4)
      split1: [false],  // 设置分屏数量
      split2: [false],  // 设置分屏数量
      split3: [false],  // 设置分屏数量
      split4: [false],  // 设置分屏数量
      wowVersion: ["70", Validators.required],
    });
    this.cycleList = [];
  }

  addSycle() {
    const index = this.cycleList.length;
    const action = new Action(index, '3', 1, 300);
    this.cycleList.push(index);
    console.log(action.buildFormControl());
    action.buildFormControl().forEach((v, key) => {
      this.addressForm?.addControl(key, v);
      console.log(key);
    });
  }

  delCyle(i: number) {
    this.cycleList.splice(i, 1);
    const action = new Action(i, '3', 1, 300);
    action.buildFormControl().forEach((_, key) => {
      this.addressForm?.removeControl(key);
    });
  }

  doFishing(): void {
    const data = this.addressForm?.getRawValue();
    const args = new ArgsData(data, -this.fishing);
    console.log(args);
    if (!window.ipcRenderer) {
      return;
    }
    const ipcRenderer = window.ipcRenderer;
    if (this.fishing !== 0) {
      ipcRenderer.send('fish', args);
    }
    this.fishing = 0;
  }
}

class ArgsData {
  fishing = -1;
  fb: string = '';
  om: string = '';
  l: string = '';
  split: string = '';
  wowVersion: string = '60';
  cycle: any[] = [];

  constructor(data: any, fishing: number) {
    this.fb = data.fb;
    this.om = data.om;
    this.l = data.l;
    this.fishing = fishing;
    this.wowVersion = data.wowVersion;
    let splitList = [];
    if (data.split1) {
      splitList.push('1');
    }
    if (data.split2) {
      splitList.push('2');
    }
    if (data.split3) {
      splitList.push('3');
    }
    if (data.split4) {
      splitList.push('4');
    }
    this.split = splitList.join(',');
    let store: any = {};
    for (let key in data) {
      if (key.indexOf(preKey) === 0) {

        const ary = key.split('_');
        const i = ary[2];
        if (!store[i]) {
          store[i] = {
            split: [],
          };
        }
        switch (ary[3]) {
          case 'key':
            store[i]['key'] = data[key];
            break;
          case 'cast':
            store[i]['cast'] = data[key];
            break;
          case 'cycle':
            store[i]['cycle'] = data[key];
            break;
          case 'split1':
            data[key] && store[i].split.push(1);
            break;
          case 'split2':
            data[key] && store[i].split.push(2);
            break;
          case 'split3':
            data[key] && store[i].split.push(3);
            break;
          case 'split4':
            data[key] && store[i].split.push(4);
        }
      }
    }
    for (let k in store) {
      this.cycle.push(store[k]);
    }
  }
}

const preKey = '_split_';
class Action {
  split1: boolean = false;
  split2: boolean = false;
  split3: boolean = false;
  split4: boolean = false;
  constructor(public index: number, public key: string, public cast: number, public cycle: number) {

  }

  buildFormControl(): Map<string, FormControl> {
    let data = new Map();
    data.set(preKey + this.index + '_key', new FormControl(this.key));
    data.set(preKey + this.index + '_cast', new FormControl(this.cast));
    data.set(preKey + this.index + '_cycle', new FormControl(this.cycle));

    data.set(preKey + this.index + '_split1', new FormControl(false));
    data.set(preKey + this.index + '_split2', new FormControl(false));
    data.set(preKey + this.index + '_split3', new FormControl(false));
    data.set(preKey + this.index + '_split4', new FormControl(false));
    return data;
  };
}