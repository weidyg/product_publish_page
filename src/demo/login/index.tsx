import styles from './style/index.module.less';
function AccountLatout() {
    return <>
        <div className={styles['header']}>

        </div>
        <div className={styles['content']}>
            <div className={styles['login-newbg']}
                style={{
                    height: '600px',
                    backgroundImage: 'url(https://gw.alicdn.com/imgextra/i3/O1CN01iyYdem1GQd1yGgA0a_!!6000000000617-0-tps-2500-600.jpg)'
                }}>
                <input type="hidden" id="J_adUrl" name="adUrl" value="" />
                <input type="hidden" id="J_adImage" name="adImage" value="" />
                <input type="hidden" id="J_adText" name="adText" value="" />
                <input type="hidden" id="J_viewFd4PC" name="viewFd4PC" value="" />
                <input type="hidden" id="J_viewFd4Mobile" name="viewFd4Mobile" value="" />
            </div>

            <div className={styles['login-adlink']}>
                <a href="https://pages.tmall.com/wow/an/cs/act/wupr?spm=a2107.1.0.0.44d211d9kPqbEG&amp;wh_biz=tm&amp;wh_pid=act%2F17693dc12b6&amp;disableNav=YES"
                    target="_blank" onClick={() => {
                        // javascript: goldlog.record('/member.11.2', '', '', 'H46777405') 
                    }} >
                </a>
            </div>

            <div className={styles['content-layout']}>
                <div className={styles['login-box-warp']} >
                    <div className={styles['login-box']}>

                        {/* <div id="login" className="width-vertical login-label-icon login-view-password taobao_pc">
                            <div className="corner-icon-view view-type-qrcode">
                                <i className="iconfont icon-qrcode"></i>
                                <div className="login-tip">
                                    <div className="poptip">
                                        <div className="poptip-arrow">
                                            <em></em>
                                            <span></span>
                                        </div>
                                        <div className="poptip-content">扫码登录更安全</div>
                                    </div>
                                </div>
                            </div>
                            <div className="login-content nc-outer-box">


                                <div className="login-password">
                                    <div className="login-blocks login-switch-tab">
                                        <a href="javascript:void(0);" target="_self" className="password-login-tab-item">密码登录</a>
                                        <a href="javascript:void(0);" target="_self" className="sms-login-tab-item">短信登录</a></div>
                                    <div id="login-error" className="login-error" style={{ display: 'none' }}>
                                        <i className="iconfont icon-warning"></i>
                                        <div className="login-error-msg"></div>
                                    </div>
                                    <div className="login-form"></div>
                                </div>
                                <div className="login-sms">
                                    <div className="login-blocks login-switch-tab">
                                        <a href="javascript:void(0);" target="_self" className="password-login-tab-item">密码登录</a>
                                        <a href="javascript:void(0);" target="_self" className="sms-login-tab-item">短信登录</a>
                                    </div>
                                    <div id="login-error" className="login-error" style={{ display: 'none' }}>
                                        <i className="iconfont icon-warning"></i>
                                        <div className="login-error-msg">
                                        </div>
                                    </div>
                                    <div className="login-form"></div>
                                </div>

                                <div className="qrcode-login">
                                    <div>
                                        <div className="qrcode-img">
                                            <canvas height="130" width="130" style={{ width: '130px', height: '130px' }}></canvas>
                                        </div>
                                        <div className="qrcode-desc">
                                            <i className="iconfont icon-scan"></i>
                                            <p>
                                                <span className="ft-gray">打开 </span>
                                                <a href="https://www.taobao.com/m" target="_blank" className="light-link">淘宝App</a> |
                                                <a href="https://www.tmall.com/wow/portal/act/app-download?mmstat=pc_login" target="_blank" className="light-link">天猫App</a>
                                                <br />
                                                <span className="ft-gray">扫一扫登录</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="login-blocks qrcode-bottom-links">
                                        <a href="javascript:void(0);" target="_self">密码登录</a>
                                        <a href="http://reg.taobao.com/member/newbie.htm?from=login" target="_blank" className="register-a-link">免费注册</a>
                                    </div>
                                </div>
                            </div>
                            <div className="extra-login-content">

                            </div>
                        </div> */}

                    </div>
                </div>
            </div>
        </div>
        <div className={styles['footer']}>
           
        </div>
    </>
}

export default AccountLatout;