"""
Utility Functions
================
Helper functions for formatting and displaying information in the demo.
"""

from typing import Optional
import sys

# ANSI color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text: str):
    """Print header text in magenta"""
    print(f"{Colors.HEADER}{Colors.BOLD}{text}{Colors.ENDC}")

def print_success(text: str):
    """Print success message in green"""
    print(f"{Colors.OKGREEN}{text}{Colors.ENDC}")

def print_error(text: str):
    """Print error message in red"""
    print(f"{Colors.FAIL}{text}{Colors.ENDC}")

def print_warning(text: str):
    """Print warning message in yellow"""
    print(f"{Colors.WARNING}{text}{Colors.ENDC}")

def print_info(text: str):
    """Print info message in cyan"""
    print(f"{Colors.OKCYAN}{text}{Colors.ENDC}")

def print_block_details(block):
    """Print detailed information about a block"""
    if block is None:
        return
    
    print_info("\n📦 Block Details:")
    print_info(f"   Block Index: {block.index}")
    print_info(f"   Timestamp: {block.timestamp}")
    print_info(f"   Block Hash: {block.hash[:32]}...")
    print_info(f"   Previous Hash: {block.previous_hash[:32]}...")
    print_info(f"   Nonce: {block.nonce}")
    print_info(f"   Data Type: {block.data.get('type', 'unknown')}")
    
    if block.data.get('type') == 'approved_signal':
        signal = block.data.get('signal', {})
        print_success(f"\n   ✅ Approved Signal:")
        print_success(f"      Command: {signal.get('command', 'N/A')}")
        print_success(f"      Frequency: {signal.get('frequency', 'N/A')} BPM")
        print_success(f"      Patient ID: {signal.get('patient_id', 'N/A')}")
    elif block.data.get('type') == 'rejection':
        print_error(f"\n   ❌ Rejection Reason:")
        print_error(f"      {block.data.get('reason', 'Unknown')}")

def format_signal(signal: dict) -> str:
    """Format signal dictionary for display"""
    return f"""
    Sender: {signal.get('sender', 'N/A')}
    Command: {signal.get('command', 'N/A')}
    Frequency: {signal.get('frequency', 'N/A')} BPM
    Nonce: {signal.get('nonce', 'N/A')}
    Patient ID: {signal.get('patient_id', 'N/A')}
    Timestamp: {signal.get('timestamp', 'N/A')}
    """

def print_transaction_details(receipt: dict):
    """Print detailed information about a blockchain transaction"""
    if receipt is None:
        return
    
    print_info("\n📦 Transaction Details:")
    print_info(f"   TX Hash: {receipt.get('tx_hash', 'N/A')}")
    print_info(f"   Block Number: {receipt.get('block', 'N/A')}")
    print_info(f"   Gas Used: {receipt.get('gas_used', 'N/A'):,}")
    
    events = receipt.get('events', [])
    if events:
        print_info(f"\n   📋 Events Emitted:")
        for event in events:
            print_success(f"      • {event['type']}")
            for key, value in event.get('data', {}).items():
                print_info(f"         {key}: {value}")
