import { Document, Packer, Paragraph, Table, TableRow, TableCell, TableWidthType, WidthType, AlignmentType, BorderStyle, HeadingLevel, TextRun, ShadingType } from 'docx'

export function generateCourtOutline(caseData) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // 标题
        new Paragraph({
          text: '庭审提纲',
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        }),

        // 基本信息表格
        new Table({
          width: { size: 100, type: TableWidthType.PERCENT },
          rows: [
            // 案件名
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: '案件名', alignment: AlignmentType.CENTER })], width: { size: 80, type: WidthType.PERCENT } }),
                new TableCell({ children: [new Paragraph({ text: caseData?.caseNumber ? `${caseData.plaintiff}诉${caseData.defendant}之${caseData.caseCause}纠纷` : 'XXX 诉 XXX 之 XXX 纠纷' })] })
              ]
            }),
            // 开庭时间
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: '开庭时间', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: caseData?.trialDate ? `${caseData.trialDate} 14 时 30 分` : '2025 年 XX 月 XX 日 XX 时 XX 分' }),
                      new TextRun({ text: '（建议 2 次以上确认开庭时间与地址）', color: 'FF0000' })
                    ]
                  })
                ] })
              ]
            }),
            // 开庭地点
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: '开庭地点', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [new Paragraph({ text: caseData?.court ? `${caseData.court} XXX 庭` : 'XXX 法院 XXX 庭' })] })
              ]
            }),
            // 案号
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: '案号', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: caseData?.caseNumber || '(2025) 浙 01XX 民初 XXX 号' }),
                      new TextRun({ text: '（如有保全）', color: '0000FF' })
                    ]
                  })
                ] })
              ]
            }),
            // 承办法官
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: '承办法官', alignment: AlignmentType.CENTER })] }),
                new TableCell({ children: [
                  new Paragraph({ text: `法官：XXX 联系电话：0571-XXX；书记员：XXX 联系电话：0571-XXX` }),
                  new Paragraph({ text: `保全法官：XXX（如有保全）`, color: '0000FF' })
                ] })
              ]
            }),
            // 证据提醒
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({
                    text: '对照证据目录和证据材料确认是否准备好证据原件！',
                    color: 'FF0000'
                  })],
                  columnSpan: 2
                })
              ]
            })
          ]
        }),

        // 一、开庭前
        new Table({
          width: { size: 100, type: TableWidthType.PERCENT },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: '一、开庭前',
                      shading: { fill: 'FFFF00' },
                      alignment: AlignmentType.CENTER
                    })
                  ],
                  width: { size: 15, type: WidthType.PERCENT }
                }),
                new TableCell({
                  children: [
                    new Paragraph({ text: '1.宣布法庭纪律' }),
                    new Paragraph({ text: '2.告知当事人诉讼权利和义务' }),
                    new Paragraph({ text: '3.查明原告/被告/上诉人/被上诉人及其诉讼代理人等是否到庭，核对身份，询问对方有无异议。' }),
                    new Paragraph({ text: `原告：${caseData?.plaintiff || 'XXX'}，男，出生日期于 XXX，身份证号：XXXXX，户籍地：_______，住所地：_______。` }),
                    new Paragraph({ text: `委托 1 名诉讼代理人，XXX 律师，XXXXX 律师事务所，代理权限为特别授权。` }),
                    new Paragraph({ text: `被告：${caseData?.defendant || 'XXXXXX'}（被告若缺席，法庭可能会让原告代为列明身份）` }),
                    new Paragraph({ text: '4. 宣布合议庭成员名单，询问是否申请回避？' }),
                    new Paragraph({ text: '不回避。' })
                  ]
                })
              ]
            })
          ]
        }),

        // 二、法庭调查
        new Table({
          width: { size: 100, type: TableWidthType.PERCENT },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: '二、法庭调查',
                      shading: { fill: 'FFFF00' },
                      alignment: AlignmentType.CENTER
                    }),
                    new Paragraph({ text: '（建议起诉状、答辩状、质证意见等复制到提纲里面，不要翻来翻去一时半会儿找不到）', color: '6699CC' })
                  ],
                  width: { size: 15, type: WidthType.PERCENT }
                }),
                new TableCell({
                  children: [
                    new Paragraph({ text: '（一）原告陈述诉讼请求与理由' }),
                    new Paragraph({ text: '1.诉讼请求（再次核对金额是否变更诉请，变更金额）', color: '0000FF' }),
                    new Paragraph({ text: '（1）' }),
                    new Paragraph({ text: '（2）' }),
                    new Paragraph({ text: '（3）' }),
                    new Paragraph({ text: '2. 事实与理由：' }),
                    new Paragraph({ text: '与书面一致。' }),
                    new Paragraph({ text: '3.诉请的法律依据（先提前准备，法官会问）', color: '0000FF' }),
                    new Paragraph({ text: '（1）《中华人民共和国民法典》第五百七十七条规定：当事人一方不履行合同义务或者履行合同义务不符合约定的，应当承担继续履行、采取补救措施或者赔偿损失等违约责任。' }),
                    new Paragraph({ text: '（2）《中华人民共和国公司法》第三条规定：公司是企业法人，有独立的法人财产，享有法人财产权。公司以其全部财产对公司的债务承担责任。有限责任公司的股东以其认缴的出资额为限对公司承担责任。' }),
                    new Paragraph({ text: '（3）《中华人民共和国民法典》第一千零六十四条规定：夫妻双方共同签名或者夫妻一方事后追认等共同意思表示所负的债务，以及夫妻一方在婚姻关系存续期间以个人名义为家庭日常生活需要所负的债务，属于夫妻共同债务。' }),
                    new Paragraph({ text: '夫妻一方在婚姻关系存续期间以个人名义超出家庭日常生活需要所负的债务，不属于夫妻共同债务；但是，债权人能够证明该债务用于夫妻共同生活、共同生产经营或者基于夫妻双方共同意思表示的除外。' }),
                    new Paragraph({ text: '（一定要多准备一些法律依据，列出所有可能涉及到的法条）', color: 'FF0000' }),
                    new Paragraph({ text: '（二）被告发表答辩意见' }),
                    new Paragraph({ text: '（被告不必过早提交答辩状，等原告说完事实与理由后再提交给法庭书面答辩状）', color: '0000FF' }),
                    new Paragraph({ text: '与书面一致。（如果法庭询问答辩意见是否和答辩状一致，回复"一致，庭上口头发表几点答辩要点"；如果法庭没有询问，按照书面阅读即可）', color: '0000FF' }),
                    new Paragraph({ text: '（三）原告举证' }),
                    new Paragraph({ text: '与书面证据目录及证据材料一致。' }),
                    new Paragraph({ text: '（四）被告质证' }),
                    new Paragraph({ text: '（如果原告当庭提交补充证据，可以提出庭后和当事人核对后补充质证向法院申请质证期限，不用着急当庭质证。当原告时也一样）', color: '0000FF' }),

                    // 质证表格
                    new Table({
                      width: { size: 100, type: TableWidthType.PERCENT },
                      rows: [
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph({ text: '序号', alignment: AlignmentType.CENTER })], width: { size: 50, type: WidthType.PERCENT } }),
                            new TableCell({ children: [new Paragraph({ text: '证据名称', alignment: AlignmentType.CENTER })] }),
                            new TableCell({ children: [new Paragraph({ text: '证明目的', alignment: AlignmentType.CENTER })] }),
                            new TableCell({ children: [new Paragraph({ text: '质证意见', alignment: AlignmentType.CENTER })] })
                          ]
                        }),
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph({ text: '1', alignment: AlignmentType.CENTER })] }),
                            new TableCell({ children: [new Paragraph({ text: '' })] }),
                            new TableCell({ children: [new Paragraph({ text: '' })] }),
                            new TableCell({ children: [new Paragraph({ text: '对 XXX 真实性、合法性认可。\n对关联性、证明目的不予认可，因 XXXXX' })] })
                          ]
                        }),
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph({ text: '2', alignment: AlignmentType.CENTER })] }),
                            new TableCell({ children: [new Paragraph({ text: '' })] }),
                            new TableCell({ children: [new Paragraph({ text: '' })] }),
                            new TableCell({ children: [new Paragraph({ text: '' })] })
                          ]
                        })
                      ]
                    }),

                    new Paragraph({ text: '（五）被告举证' }),
                    new Paragraph({ text: '与书面证据目录及证据材料一致。' }),
                    new Paragraph({ text: '（六）原告质证' }),
                    new Paragraph({ text: '_______________________' }),
                    new Paragraph({ text: '（别忘了记录争议焦点）', color: '0000FF' }),
                    new Paragraph({ text: '（七）法官提问' }),
                    new Paragraph({ text: '（案件事实复杂的时候，建议提前按照时间顺序理一下关键事件，法官可能会提问：', color: 'FF0000' }),
                    new Paragraph({ text: '2020 年 7 月 X 日，王某与李某共同出资成立 XXXX 有限公司，主营业务是 XXX', color: '0000FF' }),
                    new Paragraph({ text: '2023 年 6 月 X 日，王某与李某签订《退伙协议书》', color: '0000FF' }),
                    new Paragraph({ text: '2023 年 8 月 X 日，李某向王某支付 XXX 万元', color: '0000FF' }),
                    new Paragraph({ text: '2024 年 1 月 X 日，王某将股权转让于李某妻子张某，并完成工商登记备案生效', color: '0000FF' }),
                    new Paragraph({ text: '.......）' }),
                    new Paragraph({ text: '（1）XXX 公司的主营业务是什么，现在是否还在正常营业？', color: 'FF0000' }),
                    new Paragraph({ text: '（2）合同签订时间？', color: 'FF0000' }),
                    new Paragraph({ text: '（3）原告主张的金额如何确定，利息标准是多少？', color: 'FF0000' }),
                    new Paragraph({ text: '（如果利息标准来自于合同，将合同的条款复制在下面，向法庭指明合同依据。', color: '0000FF' }),
                    new Paragraph({ text: '利息起算时间的依据也应向法庭释明。起诉时利息计算标准严格按照双方间约定的标准来主张，如果法庭认为过高，酌情予以下调，原告也尊重法庭意见。）', color: '0000FF' }),
                    new Paragraph({ text: '（4）原告主张律师费、保全保险费的依据是什么，金额如何确定？', color: 'FF0000' }),
                    new Paragraph({ text: '（律师费依据：合同依据条款，律所收费参考指引文件，律师委托代理合同中关于律师费的约定及律所出具的发票，', color: '0000FF' }),
                    new Paragraph({ text: '保全保险费依据：合同依据条款，保险公司开具的发票和缴费通知书）', color: '0000FF' }),
                    new Paragraph({ text: '（5）王某、李某、张某三人在公司中分别担任何种职务？', color: 'FF0000' }),
                    new Paragraph({ text: '王某主管公司财务，李某和张某主管公司的业务，张某额外负责行政、人事等工作........', color: '0000FF' }),
                    new Paragraph({ text: '（6）签订《退伙协议书》时，各方是否明确知晓"退伙"实质为股权转让，张某是否知情并同意？', color: 'FF0000' }),
                    new Paragraph({ text: '案涉主体属有限责任公司，不存在"合伙"法律关系，双方自 2020 年共同出资时即登记为股东，"退伙"仅为民间表述习惯；提交王某与李某微信聊天记录（证据 4 第 14-15 页），张某明确提及"我们签的退股协议里 40 万块钱，转让是转给我老婆张某"，可见签订时双方均知晓实质是股权转让，"退伙"不影响协议核心内容', color: '0000FF' }),
                    new Paragraph({ text: '（7）工商登记的股权转让价款为 40 万元，与协议约定的 10 万元补偿款差异较大，两者是什么关系？', color: 'FF0000' }),
                    new Paragraph({ text: '工商登记的 10 万元是股权认缴出资对应的"名义转让价"，仅为满足工商变更备案格式要求（提交证据 3 第 9 页《股权转让协议》）；②4 万元补偿款是双方基于公司实际经营状况（如未实缴出资、公司净资产情况）结算的"实质对价"，有《退伙协议书》（证据 1）、王钰出具的欠条（证据 2）、微信聊天记录（王钰确认 4 万元金额）相互印证；③两者均指向同一股权转让行为（原告转让 50% 股权给余金明），4 万元是双方真实意思表示的履行依据，10 万元不影响实质价款的效力，可提交公司企信报告（证据 6 第 28-30 页）证明公司注册资本为认缴 100 万元、未实缴，进一步说明 10 万元非真实交易价格。', color: '0000FF' }),
                    new Paragraph({ text: '（7）张某是否与公司签订劳动合同？', color: 'FF0000' }),
                    new Paragraph({ text: '（8）王某是否依据合同约定在 XX 月 XX 日完成公司账目的核对与移交？', color: 'FF0000' }),
                    new Paragraph({ text: '.........' })
                  ]
                })
              ]
            })
          ]
        }),

        // 三、法庭辩论
        new Table({
          width: { size: 100, type: TableWidthType.PERCENT },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: '三、法庭辩论',
                      shading: { fill: 'FFFF00' },
                      alignment: AlignmentType.CENTER
                    })
                  ],
                  width: { size: 15, type: WidthType.PERCENT }
                }),
                new TableCell({
                  children: [
                    new Paragraph({ text: '（一）归纳争议焦点' }),
                    new Paragraph({ text: '1.' }),
                    new Paragraph({ text: '2.' }),
                    new Paragraph({ text: '3.' }),
                    new Paragraph({ text: '（二）原告发表辩论意见' }),
                    new Paragraph({ text: '' }),
                    new Paragraph({ text: '（三）被告发表辩论意见' }),
                    new Paragraph({ text: '' })
                  ]
                })
              ]
            })
          ]
        }),

        // 页脚
        new Paragraph({
          text: '第 1 页 共 3 页',
          alignment: AlignmentType.CENTER,
          spacing: { before: 300 }
        })
      ]
    }]
  })

  return doc
}

export async function downloadCourtOutline(caseData) {
  const doc = generateCourtOutline(caseData)
  const blob = await Packer.toBlob(doc)

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `庭审提纲-${caseData?.caseNumber || '模板'}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
