<div class="relative flex size-full min-h-screen flex-col bg-white">
	<div class="relative flex h-full grow flex-col">
		<main
			class="flex flex-1 items-center justify-center p-4 bg-gradient-to-br from-[var(--primary-gradient-start)] to-[var(--primary-gradient-end)]"
		>
			<div class="w-full max-w-md">
				<div class="glassmorphism-form p-8 space-y-8">
					<div class="text-center">
						<h2 class="text-3xl font-bold text-[var(--text-primary)]">Booking Information</h2>
						<p class="text-sm text-[var(--text-secondary)] mt-2">
							This is a demo page to showcase the styles from the example files.
						</p>
					</div>
					<form class="space-y-6">
						<div>
							<label class="block text-sm font-medium text-[var(--text-secondary)] mb-2" for="name"
								>Name</label
							>
							<input
								class="form-input w-full p-4 text-[var(--text-primary)] placeholder:text-gray-500 material-input"
								id="name"
								placeholder="Enter your full name"
								type="text"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-[var(--text-secondary)] mb-2" for="contact"
								>Contact Number</label
							>
							<input
								class="form-input w-full p-4 text-[var(--text-primary)] placeholder:text-gray-500 material-input"
								id="contact"
								placeholder="Enter your contact number"
								type="tel"
							/>
						</div>
						<button
							class="w-full rounded-lg bg-gradient-to-r from-[var(--button-gradient-start)] to-[var(--button-gradient-end)] py-3 text-center text-base font-bold text-white shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-purple-300"
							type="submit"
						>
							Book Now
						</button>
					</form>
				</div>
			</div>
		</main>
	</div>
</div>
