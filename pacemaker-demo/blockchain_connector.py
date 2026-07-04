"""
Blockchain Connector Module
===========================
Connects to the actual Hardhat blockchain and interacts with deployed smart contracts.
"""

import json
import os
import time
from typing import Dict, Optional, Tuple
from web3 import Web3
from web3.middleware import geth_poa_middleware
from dotenv import load_dotenv
from utils import print_info, print_success, print_error, print_warning
from performance_metrics import PerformanceMetrics

class BlockchainConnector:
    """Manages connection to Hardhat blockchain and smart contracts"""
    
    def __init__(self):
        # Load environment variables
        load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'access-control', '.env'))
        
        # Connect to local Hardhat node
        self.rpc_url = os.getenv('RPC_URL', 'http://127.0.0.1:8545')
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        
        # Add PoA middleware for local development
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        
        # Check connection
        if not self.w3.is_connected():
            raise Exception(f"Failed to connect to blockchain at {self.rpc_url}")
        
        print_success(f"✅ Connected to blockchain at {self.rpc_url}")
        print_info(f"   Chain ID: {self.w3.eth.chain_id}")
        print_info(f"   Latest Block: {self.w3.eth.block_number}\n")
        
        # Load accounts
        self.accounts = self._load_accounts()
        
        # Load contracts
        self.contracts = self._load_contracts()
        
        # Statistics
        self.transactions_sent = 0
        self.gas_used = 0
        
        # Performance metrics
        self.metrics = PerformanceMetrics('blockchain')
    
    def _load_accounts(self) -> Dict:
        """Load accounts from environment"""
        accounts = {
            'admin': {
                'address': self.w3.to_checksum_address(os.getenv('ADMIN_ADDRESS')),
                'private_key': os.getenv('ADMIN_PRIVATE_KEY'),
                'name': 'Admin',
                'role': 'Administrator'
            },
            'doctor': {
                'address': self.w3.to_checksum_address(os.getenv('DEVICE_DOCTOR_ADDRESS')),
                'private_key': os.getenv('DEVICE_DOCTOR_KEY'),
                'name': 'Dr. Smith',
                'role': 'Doctor'
            },
            'technician': {
                'address': self.w3.to_checksum_address(os.getenv('DEVICE_TECH_ADDRESS')),
                'private_key': os.getenv('DEVICE_TECH_KEY'),
                'name': 'Tech Johnson',
                'role': 'Technician'
            },
            'emergency': {
                'address': self.w3.to_checksum_address(os.getenv('DEVICE_EMERGENCY_ADDRESS')),
                'private_key': os.getenv('DEVICE_EMERGENCY_KEY'),
                'name': 'Emergency Device',
                'role': 'Emergency'
            }
        }
        
        print_info("📋 Loaded Accounts:")
        for key, acc in accounts.items():
            balance = self.w3.eth.get_balance(acc['address'])
            balance_eth = self.w3.from_wei(balance, 'ether')
            print_success(f"   • {acc['name']} ({acc['role']}): {acc['address'][:20]}... ({balance_eth:.4f} ETH)")
        
        return accounts
    
    def _load_contracts(self) -> Dict:
        """Load deployed smart contracts"""
        contracts_dir = os.path.join(os.path.dirname(__file__), '..', 'access-control')
        
        # Read deployed addresses
        with open(os.path.join(contracts_dir, 'contract-address.txt'), 'r') as f:
            command_validator_address = f.read().strip()
        
        with open(os.path.join(contracts_dir, 'deployedAddress.txt'), 'r') as f:
            access_control_address = f.read().strip()
        
        # Load ABIs
        artifacts_dir = os.path.join(contracts_dir, 'artifacts', 'contracts')
        
        with open(os.path.join(artifacts_dir, 'CommandValidator.sol', 'CommandValidator.json'), 'r') as f:
            command_validator_abi = json.load(f)['abi']
        
        with open(os.path.join(artifacts_dir, 'UnauthorizedAccessControl.sol', 'UnauthorizedAccessControl.json'), 'r') as f:
            access_control_abi = json.load(f)['abi']
        
        # Create contract instances
        contracts = {
            'command_validator': {
                'address': self.w3.to_checksum_address(command_validator_address),
                'contract': self.w3.eth.contract(
                    address=self.w3.to_checksum_address(command_validator_address),
                    abi=command_validator_abi
                ),
                'name': 'CommandValidator'
            },
            'access_control': {
                'address': self.w3.to_checksum_address(access_control_address),
                'contract': self.w3.eth.contract(
                    address=self.w3.to_checksum_address(access_control_address),
                    abi=access_control_abi
                ),
                'name': 'UnauthorizedAccessControl'
            }
        }
        
        print_info("\n📜 Loaded Smart Contracts:")
        for key, contract_info in contracts.items():
            print_success(f"   • {contract_info['name']}: {contract_info['address']}")
        
        print()
        return contracts
    
    def submit_command(self, sender_type: str, command: str) -> Tuple[bool, str, Optional[Dict]]:
        """
        Submit a command to the CommandValidator contract
        
        Args:
            sender_type: Type of sender ('admin', 'doctor', 'technician', 'emergency')
            command: Command to submit
        
        Returns:
            (success, message, details)
        """
        tx_start_time = time.time()
        
        try:
            sender = self.accounts.get(sender_type)
            if not sender:
                return False, f"Unknown sender type: {sender_type}", None
            
            contract = self.contracts['command_validator']['contract']
            
            print_info(f"\n📤 Submitting command to blockchain...")
            print_info(f"   Sender: {sender['name']} ({sender['address'][:20]}...)")
            print_info(f"   Command: {command}")
            
            # Build transaction
            build_start = time.time()
            nonce = self.w3.eth.get_transaction_count(sender['address'])
            
            tx = contract.functions.submitCommand(command).build_transaction({
                'from': sender['address'],
                'nonce': nonce,
                'gas': 500000,
            })
            build_time = time.time() - build_start
            self.metrics.record_validation(build_time)
            
            # Sign transaction
            sign_start = time.time()
            signed_tx = self.w3.eth.account.sign_transaction(tx, sender['private_key'])
            sign_time = time.time() - sign_start
            
            # Send transaction
            print_info(f"   ⏳ Sending transaction...")
            send_start = time.time()
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            send_time = time.time() - send_start
            
            # Wait for receipt
            print_info(f"   ⏳ Waiting for confirmation...")
            mine_start = time.time()
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            mine_time = time.time() - mine_start
            
            # Calculate total transaction time
            tx_duration = time.time() - tx_start_time
            
            # Check if transaction succeeded
            if receipt['status'] == 1:
                # Record successful transaction
                self.metrics.record_transaction(tx_duration, receipt['gasUsed'], success=True)
                self.metrics.record_block()
                
                print_success(f"\n   ✅ Transaction confirmed!")
                print_info(f"   TX Hash: {tx_hash.hex()}")
                print_info(f"   Block: {receipt['blockNumber']}")
                print_info(f"   Gas Used: {receipt['gasUsed']:,}")
                print_info(f"   ⏱️  Total Time: {tx_duration*1000:.2f} ms")
                print_info(f"      • Build: {build_time*1000:.2f} ms")
                print_info(f"      • Sign: {sign_time*1000:.2f} ms")
                print_info(f"      • Send: {send_time*1000:.2f} ms")
                print_info(f"      • Mine: {mine_time*1000:.2f} ms")
                
                # Parse events
                events = self._parse_command_events(contract, receipt)
                
                return True, "Command accepted by blockchain", {
                    'tx_hash': tx_hash.hex(),
                    'block': receipt['blockNumber'],
                    'gas_used': receipt['gasUsed'],
                    'events': events,
                    'latency_ms': tx_duration * 1000,
                    'breakdown': {
                        'build_ms': build_time * 1000,
                        'sign_ms': sign_time * 1000,
                        'send_ms': send_time * 1000,
                        'mine_ms': mine_time * 1000
                    }
                }
            else:
                return False, "Transaction failed", None
                
        except Exception as e:
            tx_duration = time.time() - tx_start_time
            error_msg = str(e)
            
            # Parse revert reason and record as threat
            reason = "Transaction error"
            if 'execution reverted' in error_msg.lower():
                if 'Cooldown period active' in error_msg:
                    reason = "Rate limit: Cooldown period active"
                    self.metrics.record_threat("rate_limit")
                elif 'Malicious pattern detected' in error_msg:
                    reason = "Malicious pattern detected in command"
                    self.metrics.record_threat("malicious_pattern")
                elif 'Command not allowed' in error_msg:
                    reason = "Command not in allowed list"
                    self.metrics.record_threat("invalid_command")
                elif 'Command already used' in error_msg:
                    reason = "Replay attack: Command already used"
                    self.metrics.record_threat("replay_attack")
                elif 'Sender is blacklisted' in error_msg:
                    reason = "Sender is blacklisted"
                    self.metrics.record_threat("unauthorized")
                elif 'System is paused' in error_msg:
                    reason = "System is paused"
                    self.metrics.record_threat("system_paused")
            else:
                reason = f"Transaction error: {error_msg}"
            
            self.metrics.record_transaction(tx_duration, success=False, failure_reason=reason)
            
            return False, reason, None
    
    def _parse_command_events(self, contract, receipt) -> list:
        """Parse events from transaction receipt"""
        events = []
        
        # Get CommandAccepted events
        try:
            accepted_events = contract.events.CommandAccepted().process_receipt(receipt)
            for event in accepted_events:
                events.append({
                    'type': 'CommandAccepted',
                    'data': event['args']
                })
        except:
            pass
        
        # Get CommandRejected events
        try:
            rejected_events = contract.events.CommandRejected().process_receipt(receipt)
            for event in rejected_events:
                events.append({
                    'type': 'CommandRejected',
                    'data': event['args']
                })
        except:
            pass
        
        return events
    
    def check_access(self, device_address: str, roles: list, purpose: str) -> Tuple[bool, str]:
        """
        Check access through UnauthorizedAccessControl contract
        
        Args:
            device_address: Address of the device
            roles: List of roles
            purpose: Purpose of access
        
        Returns:
            (granted, reason)
        """
        try:
            contract = self.contracts['access_control']['contract']
            
            # Call the checkAccess function
            result = contract.functions.checkAccess(
                self.w3.to_checksum_address(device_address),
                roles,
                purpose
            ).call()
            
            granted, reason = result
            return granted, reason
            
        except Exception as e:
            return False, f"Access check failed: {str(e)}"
    
    def get_account_info(self, sender_type: str) -> Optional[Dict]:
        """Get account information"""
        return self.accounts.get(sender_type)
    
    def get_performance_metrics(self) -> PerformanceMetrics:
        """Get performance metrics object"""
        return self.metrics
    
    def get_statistics(self) -> Dict:
        """Get blockchain interaction statistics"""
        return {
            'connected': self.w3.is_connected(),
            'rpc_url': self.rpc_url,
            'chain_id': self.w3.eth.chain_id,
            'latest_block': self.w3.eth.block_number,
            'transactions_sent': self.transactions_sent,
            'total_gas_used': self.gas_used,
            'accounts_loaded': len(self.accounts),
            'contracts_loaded': len(self.contracts)
        }
    
    def get_contract_state(self, contract_name: str) -> Dict:
        """Get current state of a contract"""
        try:
            if contract_name == 'command_validator':
                contract = self.contracts['command_validator']['contract']
                return {
                    'owner': contract.functions.owner().call(),
                    'paused': contract.functions.paused().call(),
                    'cooldown': contract.functions.cooldown().call()
                }
            elif contract_name == 'access_control':
                contract = self.contracts['access_control']['contract']
                return {
                    'owner': contract.functions.owner().call(),
                    'emergency_mode': contract.functions.emergencyMode().call()
                }
        except Exception as e:
            return {'error': str(e)}
    
    def wait_for_cooldown(self, sender_type: str) -> int:
        """Get remaining cooldown time for sender"""
        try:
            sender = self.accounts.get(sender_type)
            if not sender:
                return 0
            
            contract = self.contracts['command_validator']['contract']
            last_time = contract.functions.lastCommandTime(sender['address']).call()
            cooldown = contract.functions.cooldown().call()
            current_time = self.w3.eth.get_block('latest')['timestamp']
            
            next_allowed = last_time + cooldown
            remaining = max(0, next_allowed - current_time)
            
            return remaining
        except:
            return 0