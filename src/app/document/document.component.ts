import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { ProcessClose } from '../common';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit {

  macroData: any = {
    '钓鱼': [
      '#showtooltip 钓鱼',
      '/equip 纳特-帕格的超级钓鱼竿FC-5000型',
      '/施放 钓鱼'
    ],
    '开箱子': [
      '#showtooltip 开箱子',
      '/use 巨型蚌壳',
      '/use 沉重的箱子',
      '/use 浸水的箱子',
    ],
    '上鱼饵': [
      '#showtooltip 上鱼饵',
      '/use 锐利的鱼钩',
      '/use 16',
      '/click StaticPopup1Button1',
    ],
  };

  macroList: string[] = [];

  constructor(private _snackBar: MatSnackBar, private clipboard: Clipboard) { }

  close() {
    ProcessClose();
  }

  copy(name: string) {
    const list = this.macroData[name];
    let s = '';
    for (let v of list) {
      s += v + '\r\n';
    }
    this.clipboard.copy(s);
    // this.clipboard.('Alphonso');
    this._snackBar.open('复制成功', '确定', { duration: 500 });
  }

  ngOnInit(): void {
    for (let k in this.macroData) {
      this.macroList.push(k);
    }
  }

}
