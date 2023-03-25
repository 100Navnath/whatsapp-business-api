import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GetNumber from './GetNumber';
import LinkedNumbers from './LinkedNumbers';
import './numberManagement.css'
export default function NumberManagement(props: any) {
    let navigate = useNavigate()
    // const [thirdTab, setThirdTab] = useState(props.thirdTab);

    function linkNumber() {
        navigate('/settings/user-management');
        // setThirdTab('LinkedNumbers')
        props.switchThirdTab('userMngmt')
    }

    function _getNumber() {
        navigate('/settings/number-management/get-number');
        // setThirdTab('getNumber');
        props.switchThirdTab('getNumber');
    }

    return (
        <>
            {
                props.thirdTab == 'LinkedNumbers' ?
                    <LinkedNumbers getNumber={_getNumber} />
                    :
                    props.thirdTab == 'getNumber' ?
                        <GetNumber linkNumber={linkNumber} setIsDisable={props.setIsDisable} switchThirdTab={(tab: string) => props.switchThirdTab(tab)} /> :
                        <div className='empty-screen-wrapper' style={{ flexDirection: 'column', padding: 40 }}>
                            <img src={require('../../../assets/img/empty-display.png')} />
                            <div className='descriptive-text'>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sollicitudin ultrices est quis vehicula. Donec augue libero, feugiat nec leo at, malesuada malesuada nisi.
                                <a className='link' onClick={_getNumber}>get number</a>
                            </div>
                        </div>
            }
        </>
    )
}
